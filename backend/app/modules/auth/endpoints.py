from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from ..users.crud import create_user, update_user_password
from .schemas import (
    SignupRequest,
    SignupResponse,
    LoginRequest,
    LoginResponse,
    RefreshTokenRequest,
    AccessTokenResponse,
    RefreshTokenResponse,
    ChangePasswordRequest,
    ChangePasswordResponse,
    DeleteAccountResponse,
)
from ...core.auth import hash_password, create_access_token, verify_password, verify_token, TokenType
from ...core.config import get_db
from ..users.crud import get_user_by_username, delete_user
from ...core.exceptions import (
    AppException,
    UserNotFoundException, 
    InvalidCredentialsException, 
    UsernameExistsException,
    AuthTokenExpiredException,
    InvalidAuthHeaderException,
    AccountDeletionFailedException,
    InvalidTokenException,
    InvalidTokenTypeException,
    InvalidUsernameFormatException,
    InvalidPasswordFormatException
)
from fastapi.responses import PlainTextResponse
import re

router = APIRouter(prefix="/auth", tags=["auth"])


def validate_username(username: str):
    if not (6 <= len(username) <= 16):
        return PlainTextResponse("아이디는 영문자와 숫자로 이루어진 6~16자여야 합니다.", status_code=422)
    if not re.match(r"^[a-zA-Z0-9]+$", username):
        return PlainTextResponse("아이디는 영문자와 숫자로 이루어진 6~16자여야 합니다.", status_code=422)
    return None

def validate_password(password: str):
    if not (8 <= len(password) <= 32):
        return PlainTextResponse("비밀번호는 영문자와 숫자를 모두 포함한 8~32자여야 합니다.", status_code=422)
    if not re.search(r"[a-zA-Z]", password) or not re.search(r"[0-9]", password):
        return PlainTextResponse("비밀번호는 영문자와 숫자를 모두 포함한 8~32자여야 합니다.", status_code=422)
    return None


@router.post("/signup", response_model=SignupResponse, status_code=201, 
            responses=AppException.to_openapi_examples([
                UsernameExistsException,
                InvalidUsernameFormatException,
                InvalidPasswordFormatException
            ]))
def signup(request: SignupRequest, db: Session = Depends(get_db)):

    resp = validate_username(request.username)
    if resp:
        return resp

    resp = validate_password(request.password)
    if resp:
        return resp
    


    # username 중복 체크
    if get_user_by_username(db, request.username):
        return PlainTextResponse("이미 존재하는 아이디입니다.", status_code=400);
    # 비밀번호 해싱
    hashed_pw = hash_password(request.password)
    # 유저 생성
    nickname = request.nickname if request.nickname.strip() else request.username
    user = create_user(db, request.username, hashed_pw, nickname)
    # 토큰 생성
    data = {"sub": user.username}
    access_token = create_access_token(data, TokenType.ACCESS_TOKEN)
    refresh_token = create_access_token(data, TokenType.REFRESH_TOKEN)
    return SignupResponse(
        access_token=access_token, 
        refresh_token=refresh_token,
        user={"id": user.id, "username": user.username, "nickname": user.nickname}
    )


@router.post("/login", response_model=LoginResponse, 
            responses=AppException.to_openapi_examples([
                UserNotFoundException,
                InvalidCredentialsException,
                InvalidUsernameFormatException,
                InvalidPasswordFormatException
            ]))
def login(request: LoginRequest, db: Session = Depends(get_db)):


    resp = validate_username(request.username)
    if resp:
        return resp

    resp = validate_password(request.password)
    if resp:
        return resp

    # 사용자 조회
    user = get_user_by_username(db, request.username)
    if not user:
        return PlainTextResponse("존재하지 않는 아이디입니다.", status_code=400)
    
    # 비밀번호 검증
    if not verify_password(request.password, user.hashed_password):
        return PlainTextResponse("비밀번호가 올바르지 않습니다.", status_code=400)
    
    # 토큰 생성
    data = {"sub": user.username}
    access_token = create_access_token(data, TokenType.ACCESS_TOKEN)
    refresh_token = create_access_token(data, TokenType.REFRESH_TOKEN)
    
    return LoginResponse(
        access_token=access_token, 
        refresh_token=refresh_token,
        user={"id": user.id, "username": user.username, "nickname": user.nickname}
    )


@router.post(
    "/change-password",
    response_model=ChangePasswordResponse,
    responses=AppException.to_openapi_examples([
        InvalidAuthHeaderException,
        UserNotFoundException,
        AuthTokenExpiredException,
        InvalidTokenException,
        InvalidTokenTypeException,
        InvalidCredentialsException,
        InvalidPasswordFormatException,
    ]),
)
def change_password(
    request: ChangePasswordRequest,
    authorization: str = Header(...),
    db: Session = Depends(get_db),
):
    if not authorization.startswith("Bearer "):
        return PlainTextResponse("인증 토큰이 포함되지 않았습니다. 개발자 문의해주세요.", status_code=401)

    access_token = authorization[7:]
    token_data = verify_token(access_token, TokenType.ACCESS_TOKEN)
    username = token_data["username"]

    user = get_user_by_username(db, username)
    if not user:
        return PlainTextResponse("존재하지 않는 유저입니다.", status_code=400)

    if not verify_password(request.current_password, user.hashed_password):
        return PlainTextResponse("인증 정보가 올바르지 않습니다.", status_code=401)

    hashed_pw = hash_password(request.new_password)
    update_user_password(db, user, hashed_pw)

    return ChangePasswordResponse(message="성공적으로 패스워드가 변경되었습니다.")


@router.post("/refresh/access", response_model=AccessTokenResponse, 
            responses=AppException.to_openapi_examples([
                UserNotFoundException,
                AuthTokenExpiredException,
                InvalidTokenException,
                InvalidTokenTypeException
            ]))
def reissue_access_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    # refresh token 검증
    token_data = verify_token(request.refresh_token, TokenType.REFRESH_TOKEN)
    username = token_data["username"]
    
    user = get_user_by_username(db, username)
    if not user:
        return PlainTextResponse("존재하지 않는 유저입니다.", status_code=400)
    
    # 새로운 access token 생성
    data = {"sub": user.username}
    new_access_token = create_access_token(data, TokenType.ACCESS_TOKEN)
    
    return AccessTokenResponse(access_token=new_access_token)




@router.delete("/delete-account", response_model=DeleteAccountResponse,
                responses=AppException.to_openapi_examples([
                    InvalidAuthHeaderException,
                    UserNotFoundException,
                    AuthTokenExpiredException,
                    InvalidTokenException,
                    InvalidTokenTypeException,
                    AccountDeletionFailedException
                ]))
def delete_account(authorization: str = Header(), db: Session = Depends(get_db)):
    # Bearer 토큰에서 access token 추출
    if not authorization.startswith("Bearer "):
        return PlainTextResponse("인증 토큰이 포함되지 않았습니다. 개발자 문의해주세요.", status_code=401)
    
    access_token = authorization[7:]
    
    # 토큰 검증
    token_data = verify_token(access_token, TokenType.ACCESS_TOKEN)
    username = token_data["username"]
    
    # 사용자 조회
    user = get_user_by_username(db, username)
    if not user:
        return PlainTextResponse("존재하지 않는 유저입니다.", status_code=400)
    
    # 계정 삭제
    if delete_user(db, username):
        return DeleteAccountResponse(message="Account deleted successfully")
    else:
        return PlainTextResponse("계정 삭제에 실패했습니다.", status_code=401)

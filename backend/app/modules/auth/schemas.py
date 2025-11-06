from pydantic import BaseModel, Field, field_validator
import re
from ...core.exceptions import InvalidUsernameFormatException, InvalidPasswordFormatException


class UserCredentials(BaseModel):
    username: str
    password: str

class UserInfo(BaseModel):
    id: int
    username: str
    nickname: str

class TokensResponse(BaseModel):
    access_token: str
    refresh_token: str


class SignupRequest(UserCredentials):
    nickname: str = Field(default="")

class SignupResponse(TokensResponse):
    user: UserInfo

class LoginRequest(UserCredentials):
    pass

class LoginResponse(TokensResponse):
    user: UserInfo

class RefreshTokenRequest(BaseModel):
    refresh_token: str


class RefreshTokenResponse(BaseModel):
    refresh_token: str
class AccessTokenResponse(BaseModel):
    access_token: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    @field_validator("current_password", "new_password")
    @classmethod
    def validate_password(cls, v):
        if not (8 <= len(v) <= 32):
            raise InvalidPasswordFormatException()
        if not re.search(r"[a-zA-Z]", v) or not re.search(r"[0-9]", v):
            raise InvalidPasswordFormatException()
        return v

class ChangePasswordResponse(BaseModel):
    message: str

class DeleteAccountResponse(BaseModel):
    message: str

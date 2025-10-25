from fastapi import FastAPI
from .modules.auth.endpoints import router as auth_router
from .modules.users.endpoints import router as users_router
from .modules.audio.endpoints import router as audio_router
from .modules.survey.endpoints import router as survey_router
from .modules.personalization.endpoints import router as personalization_router
from .core.config import engine, Base
from .core.exceptions import register_exception_handlers
app = FastAPI(title="LingoFit")

# 테이블 생성
Base.metadata.create_all(bind=engine)


register_exception_handlers(app)

app.include_router(auth_router, prefix = "/api/v1")
app.include_router(users_router, prefix = "/api/v1")
app.include_router(audio_router, prefix = "/api/v1/audio")
app.include_router(survey_router, prefix = "/api/v1")
app.include_router(personalization_router, prefix = "/api/v1")




@app.get("/")
def read_root():
    return {"message": "Hello World"}
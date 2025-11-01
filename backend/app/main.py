from fastapi import FastAPI
from .modules.auth.endpoints import router as auth_router
from .modules.users.endpoints import router as users_router
from .modules.audio.endpoints import router as audio_router
from .modules.survey.endpoints import router as survey_router
from .modules.level_management.endpoints import router as level_management_router
from .modules.stats.endpoints import router as stats_router
from .modules.vocab.endpoints import router as vocab_router
from .core.config import engine, Base
from .core.config import engine, Base, apply_startup_migrations
from .core.exceptions import register_exception_handlers
app = FastAPI(title="LingoFit")

# 테이블 생성
Base.metadata.create_all(bind=engine)
apply_startup_migrations()


register_exception_handlers(app)

app.include_router(auth_router, prefix = "/api/v1")
app.include_router(users_router, prefix = "/api/v1")
app.include_router(audio_router, prefix = "/api/v1/audio")
app.include_router(survey_router, prefix = "/api/v1")
app.include_router(level_management_router, prefix = "/api/v1")
app.include_router(stats_router, prefix = "/api/v1")
app.include_router(vocab_router, prefix = "/api/v1")




@app.get("/")
def read_root():
    return {"message": "Hello World"}

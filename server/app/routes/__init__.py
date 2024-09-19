"""
This file initializes the API router and includes all the sub-routers for different functionalities.

- Includes routers for signup, login, song management, token verification and WebSocket routes.
"""

from fastapi import APIRouter
from .signup_route import router as signup_router
from .login_route import router as login_router
from .token_verification_route import router as token_verification_router
from .songs_route import router as songs_router
from .web_socket_route import router as web_socket_router

router = APIRouter()
router.include_router(signup_router)
router.include_router(login_router)
router.include_router(token_verification_router)
router.include_router(songs_router)
router.include_router(web_socket_router)
@echo off
setlocal EnableExtensions
cd /d "%~dp0"

title 2048
color 0E

echo.
echo  ============================================
echo   2048 - modo oscuro
echo  ============================================
echo.
echo  Deja esta ventana abierta mientras juegues.
echo  Cerrar la ventana = apagar el juego.
echo.
echo  PC:        http://127.0.0.1:2048
echo  iPhone:    http://192.168.1.27:2048
echo  Tailscale: http://100.99.168.20:2048
echo.
echo  En el iPhone: Safari - Compartir - Agregar a inicio
echo.

python server.py
set EXITCODE=%ERRORLEVEL%

echo.
if not "%EXITCODE%"=="0" (
  echo  El servidor se detuvo con error %EXITCODE%.
) else (
  echo  Servidor detenido.
)
echo.
pause
exit /b %EXITCODE%

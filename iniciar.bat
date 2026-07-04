@echo off
title Panel de Control - Calculadora Multitema
cls

:: Definir colores para CMD (Fondo negro 0, texto celeste B)
color 0B

:: 1. Validar que Node.js este instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    cls
    color 0C
    echo ==========================================================
    echo   ERROR: NO SE DETECTO NODE.JS INSTALADO
    echo ==========================================================
    echo.
    echo   Para ejecutar esta aplicacion web localmente, necesitas
    echo   instalar Node.js en tu sistema obligatoriamente.
    echo.
    echo   No puedes simplemente hacer doble clic en el archivo "index.html"
    echo   porque los navegadores bloquean la carga de modulos React por seguridad.
    echo.
    echo   Solucion rapida paso a paso:
    echo   1. Ingresa a la web oficial de Node.js: https://nodejs.org/
    echo   2. Descarga e instala la version recomendada (LTS).
    echo   3. Una vez termine la instalacion, cierra esta ventana
    echo      y vuelve a abrir "iniciar.bat".
    echo.
    echo ==========================================================
    pause
    exit
)

:menu
cls
color 0B
echo ==========================================================
echo           CALCULADORA MULTITEMA - PANEL LOCAL
echo ==========================================================
echo.
echo   Este panel automatiza la ejecucion local de tu calculadora.
echo.
echo   [1] Iniciar Servidor de Desarrollo (Abre la web automaticamente)
echo   [2] Instalar dependencias (Ejecutar la primera vez)
echo   [3] Compilar aplicacion final (Para produccion)
echo   [4] Salir
echo.
echo ==========================================================
set /p opcion="Selecciona una opcion [1-4]: "

if "%opcion%"=="1" goto iniciar_dev
if "%opcion%"=="2" goto instalar_dep
if "%opcion%"=="3" goto build_preview
if "%opcion%"=="4" goto salir

echo.
echo Opcion no valida. Intentalo de nuevo.
pause
goto menu

:iniciar_dev
cls
echo ==========================================================
echo          INICIANDO SERVIDOR WEB LOCAL (VITE)
echo ==========================================================
echo.
if not exist node_modules (
    echo [AVISO] No se detecto la carpeta 'node_modules'.
    echo Instalando los paquetes necesarios de manera automatica...
    echo.
    call npm install
)
echo.
echo Ejecutando servidor web local...
echo Vite abrira tu navegador de forma automatica en cuanto este listo.
echo.
echo ----------------------------------------------------------
echo   NOTA: Si tu navegador no se abre automaticamente,
echo         puedes entrar de forma manual en: http://localhost:3000
echo ----------------------------------------------------------
echo.
echo Para apagar el servidor, presiona CTRL + C en esta ventana.
echo.
call npm run dev -- --open
pause
goto menu

:instalar_dep
cls
echo ==========================================================
echo            INSTALANDO PAQUETES Y DEPENDENCIAS
echo ==========================================================
echo.
echo Descargando React, Tailwind CSS, Motion y Lucide...
echo.
call npm install
echo.
echo [OK] Instalacion completada correctamente!
echo Ahora puedes iniciar el servidor con la opcion [1].
echo.
pause
goto menu

:build_preview
cls
echo ==========================================================
echo          COMPILANDO A PRODUCCION Y PREVISUALIZACION
echo ==========================================================
echo.
echo Compilando la aplicacion para optimizar peso y rendimiento...
call npm run build
echo.
echo Iniciando previsualizacion del sitio web optimizado...
echo Vite abrira tu navegador de forma automatica en cuanto este listo.
echo.
call npm run preview -- --open
pause
goto menu

:salir
cls
echo Gracias por usar la Calculadora Multitema! Hasta luego.
timeout /t 3 > nul
exit

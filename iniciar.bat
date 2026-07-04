@echo off
title Panel de Control - Calculadora Multitema
chcp 65001 > nul
cls

:: Definir colores para CMD (Fondo negro 0, texto celeste B)
color 0B

:: 1. Validar que Node.js esté instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    cls
    color 0C
    echo ==========================================================
    echo  ❌ ERROR: NO SE DETECTÓ NODE.JS INSTALADO
    echo ==========================================================
    echo.
    echo  Para ejecutar esta aplicación web localmente, necesitas tener
    echo  instalado Node.js en tu sistema de manera obligatoria.
    echo.
    echo  👉 Solución rápida paso a paso:
    echo  1. Ingresa a la web oficial de Node.js: https://nodejs.org/
    echo  2. Descarga e instala la versión recomendada (LTS).
    echo  3. Una vez termine la instalación, cierra esta ventana y 
    echo     vuelve a ejecutar "iniciar.bat".
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
echo   Este panel automatiza la ejecución local de tu calculadora.
echo.
echo   [1] Iniciar Servidor de Desarrollo (Para jugar/modificar)
echo   [2] Instalar dependencias (¡Ejecútalo la primera vez!)
echo   [3] Compilar aplicación final (Para producción óptima)
echo   [4] Salir
echo.
echo ==========================================================
set /p opcion="Selecciona una opción [1-4]: "

if "%opcion%"=="1" goto iniciar_dev
if "%opcion%"=="2" goto instalar_dep
if "%opcion%"=="3" goto build_preview
if "%opcion%"=="4" goto salir

echo.
echo Opción no válida. Inténtalo de nuevo.
pause
goto menu

:iniciar_dev
cls
echo ==========================================================
echo          INICIANDO SERVIDOR WEB LOCAL (VITE)
echo ==========================================================
echo.
if not exist node_modules (
    echo [AVISO] No se detectó la carpeta 'node_modules'.
    echo Instalando los paquetes necesarios de manera automática...
    echo.
    call npm install
)
echo.
echo Ejecutando servidor web local...
echo.
echo ----------------------------------------------------------
echo  👉 NOTA: Abre la dirección URL que aparezca en pantalla,
echo          usualmente http://localhost:3000 o http://localhost:5173
echo ----------------------------------------------------------
echo.
echo Para apagar el servidor, presiona CTRL + C en esta ventana.
echo.
call npm run dev
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
echo [✓] ¡Instalación completada correctamente!
echo Ahora puedes iniciar el servidor con la opción [1].
echo.
pause
goto menu

:build_preview
cls
echo ==========================================================
echo          COMPILANDO A PRODUCCIÓN Y PREVISUALIZACIÓN
echo ==========================================================
echo.
echo Compilando la aplicación para optimizar peso y rendimiento...
call npm run build
echo.
echo Iniciando previsualización del sitio web optimizado...
call npm run preview
pause
goto menu

:salir
cls
echo ¡Gracias por usar la Calculadora Multitema! Hasta luego.
timeout /t 3 > nul
exit

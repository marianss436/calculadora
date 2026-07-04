@echo off
title Calculadora Multitema - Panel de Control
chcp 65001 > nul
cls

:: Definir colores para CMD (Fondo negro 0, texto celeste B)
color 0B

:menu
cls
echo ==========================================================
echo           CALCULADORA MULTITEMA - AUTOMATIZACIÓN
echo ==========================================================
echo.
echo   Este archivo automatiza la ejecución de tu calculadora local.
echo.
echo   [1] Iniciar Servidor de Desarrollo (Recomendado)
echo   [2] Instalar Dependencias (Ejecutar si es la primera vez)
echo   [3] Compilar y Previsualizar en Producción
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
echo        INICIANDO SERVIDOR DE DESARROLLO (VITE)
echo ==========================================================
echo.
if not exist node_modules (
    echo [ADVERTENCIA] No se detectó la carpeta 'node_modules'.
    echo Instalando dependencias necesarias primero...
    echo.
    call npm install
)
echo.
echo Ejecutando servidor... Abre http://localhost:3000 en tu navegador.
echo Presiona CTRL + C en esta ventana para detener el servidor.
echo.
call npm run dev
pause
goto menu

:instalar_dep
cls
echo ==========================================================
echo                INSTALANDO DEPENDENCIAS (NPM)
echo ==========================================================
echo.
echo Esto descargará los paquetes necesarios para la aplicación.
echo.
call npm install
echo.
echo ¡Instalación completada correctamente!
pause
goto menu

:build_preview
cls
echo ==========================================================
echo             COMPILANDO Y PREVISUALIZANDO
echo ==========================================================
echo.
echo Compilando la aplicación...
call npm run build
echo.
echo Iniciando previsualización...
call npm run preview
pause
goto menu

:salir
cls
echo ¡Gracias por usar la Calculadora Multitema! Hasta luego.
timeout /t 3 > nul
exit

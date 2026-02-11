@echo off
echo ========================================
echo  MIGRACAO DE BANCO DE DADOS - TURSO
echo ========================================
echo.

REM Carregar DATABASE_URL do .env
for /f "tokens=1,2 delims==" %%a in (.env) do (
    if "%%a"=="DATABASE_URL" set DATABASE_URL=%%b
)

REM Extrair o nome do banco de dados da URL
for /f "tokens=2 delims=/" %%a in ("%DATABASE_URL%") do set DB_NAME=%%a

if "%DB_NAME%"=="" (
    echo ERRO: Nao foi possivel extrair o nome do banco de dados.
    echo Verifique se DATABASE_URL esta configurado corretamente no .env
    pause
    exit /b 1
)

echo Nome do banco de dados: %DB_NAME%
echo.
echo Executando migracao SQL...
echo.

turso db shell %DB_NAME% < migrations\0000_new_black_panther.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo  MIGRACAO CONCLUIDA COM SUCESSO!
    echo ========================================
    echo.
    echo Tabelas criadas:
    echo   - users, admins, pathologies
    echo   - videos, ebooks, consultations
    echo   - subscriptions, user_access
    echo   - leads, notifications
    echo   - admin_notifications, system_settings
    echo.
) else (
    echo.
    echo ========================================
    echo  ERRO NA MIGRACAO
    echo ========================================
    echo.
    echo Possíveis causas:
    echo 1. Turso CLI nao esta instalado
    echo 2. Voce nao esta autenticado no Turso
    echo 3. Nome do banco de dados incorreto
    echo.
    echo Solucoes:
    echo 1. Instale o Turso CLI: https://docs.turso.tech/cli/installation
    echo 2. Faca login: turso auth login
    echo 3. Verifique o nome do banco: turso db list
    echo.
)

pause

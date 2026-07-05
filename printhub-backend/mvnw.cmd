@echo off
setlocal
set MAVEN_PROJECTBASEDIR=%~dp0

set MAVEN_WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar
if not exist "%MAVEN_WRAPPER_JAR%" (
    echo Maven Wrapper JAR not found. Please run install-maven-wrapper.ps1 or ensure the .mvn/wrapper directory exists.
    exit /b 1
)

rem Determine Java executable
set JAVA_EXE=java
where java >nul 2>&1
if %errorlevel% neq 0 (
    echo Java not found in PATH. Please install JDK 21 or higher.
    exit /b 1
)

rem Execute Maven Wrapper
%JAVA_EXE% -classpath "%MAVEN_WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain %*

endlocal

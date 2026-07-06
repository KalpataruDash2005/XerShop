@echo off
set JAVA_HOME=C:\Program Files\JetBrains\IntelliJ IDEA 2026.1.2\jbr
set PATH=%JAVA_HOME%\bin;%PATH%
cd /d "D:\Coading World\XeroxBooking\v1\XerShop\printhub-backend"
java "-Dmaven.multiModuleProjectDirectory=D:\Coading World\XeroxBooking\v1\XerShop\printhub-backend" -classpath ".mvn\wrapper\maven-wrapper.jar" org.apache.maven.wrapper.MavenWrapperMain spring-boot:run -Dspring-boot.run.arguments=--server.port=8081 > backend.log 2>&1

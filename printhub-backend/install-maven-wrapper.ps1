# PowerShell script to set up Maven Wrapper for the project
# This will download the Maven Wrapper JAR and properties file into the .mvn/wrapper directory.
# After running this script, you can start the application with:
#   .\mvnw.cmd spring-boot:run

$wrapperDir = "${PSScriptRoot}\.mvn\wrapper"
if (-Not (Test-Path $wrapperDir)) {
    New-Item -ItemType Directory -Path $wrapperDir -Force | Out-Null
}

# URLs for Maven Wrapper version 0.5.6 (can be updated if needed)
$propertiesUrl = "https://repo.maven.apache.org/maven2/io/takari/maven-wrapper/0.5.6/maven-wrapper-0.5.6.properties"
$jarUrl = "https://repo.maven.apache.org/maven2/io/takari/maven-wrapper/0.5.6/maven-wrapper-0.5.6.jar"

Write-Host "Downloading Maven Wrapper properties..."
Invoke-WebRequest -Uri $propertiesUrl -OutFile (Join-Path $wrapperDir "maven-wrapper.properties")
Write-Host "Downloading Maven Wrapper jar..."
Invoke-WebRequest -Uri $jarUrl -OutFile (Join-Path $wrapperDir "maven-wrapper.jar")

Write-Host "Maven Wrapper setup complete. You can now run .\\mvnw.cmd spring-boot:run" , "`n"

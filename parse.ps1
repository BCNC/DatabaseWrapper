Write-Host "Hello, David I am working!"
Write-Host "Input"
Write-Host $args[0]
Write-Host "Output"
Write-Host $args[1]
java -cp '..\ResumeParser-master\ResumeTransducer\bin\*;..\ResumeParser-master\GATEFiles\lib\*;..\ResumeParser-master\GATEFILES\bin\gate.jar;..\ResumeParser-master\ResumeTransducer\lib\*' code4goal.antony.resumeparser.ResumeParserProgram $args[0] $args[1]
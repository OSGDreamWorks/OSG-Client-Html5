@echo off

echo =============================================================
echo start build javascript Protobuf
if not exist node_modules\protobufjs goto installProtobuf
echo get Protobuf
goto doneProtobuf
:installProtobuf
npm install protobufjs
:doneProtobuf
node  "node_modules\protobufjs\bin\pbjs" msg.proto -target=js > msg.js

move msg.js ..\..\src\msg.js
echo OK
echo =============================================================
echo. 
echo. 
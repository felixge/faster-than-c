#include <node.h>
#include <v8.h>

using namespace v8;

Handle<Value> TwentyThree(const Arguments& args) {
  HandleScope scope;
  return scope.Close(Number::New(23));
}

void init(Handle<Object> target) {
  target->Set(
    String::NewSymbol("twentyThree"),
    FunctionTemplate::New(TwentyThree)->GetFunction()
  );
}
NODE_MODULE(cpp, init)

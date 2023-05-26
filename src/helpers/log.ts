//export const getIsWidgetContext = () => window.parent !== window
var DEBUG=false;
export var log = function(){
    if(DEBUG){
        console.log.apply(console, arguments);
    }
}
export function enableDebugPrints(){
    DEBUG=true
    return "debug prints are ON"
}

export function disableDebugPrints(){
    DEBUG=false
    return "debug prints are OFF"
}
"use strict";

if(!window.browser){window.browser=window.chrome;}

var settings={
	minInterval: 400,
	supportsPassive: false,
};

//detect passive event support
try {
	var opts = Object.defineProperty({}, 'passive', {
		get: function() {
			settings.supportsPassive = true;
		}
	});
	window.addEventListener("testPassive", null, opts);
	window.removeEventListener("testPassive", null, opts);
} catch (e) {}

function applyRule(rule){
	var lastEvent=null;
	document.addEventListener("wheel",function(e){
		if(e.altKey){
			var a=null;
			if(e.deltaX>0){
				a=document.querySelector(rule.prev);
			}else if(e.deltaX<0){
				a=document.querySelector(rule.next);
			}
			if(a!=null&&(lastEvent==null||e.timeStamp-lastEvent.timeStamp>=settings.minInterval)){
				a.click();
				e.stopImmediatePropagation();
				lastEvent=e;
			}
		}
	},settings.supportsPassive&&{passive:true});
}

browser.storage.local.get(["rules"],function(result) {
	var host=location.host;
	var rule=result.rules.find((rule)=>new RegExp("^"+rule.hostPattern+"$").test(host));
	if(rule!=null){
		console.debug("rule for '"+host+"' is "+JSON.stringify(rule,["host","prev","next"]));
		applyRule(rule);
	}
});

(function (){
 var ie = !!(window.attachEvent && !window.opera);  
    var wk = /webkit\/(\d+)/i.test(navigator.userAgent) && (RegExp.$1 < 525);  
    var fn = [];   
    var run = function () {   
      for (var i = 0; i < fn.length; i++) fn[i]();   
    };   
    var d = document;   
    d.ready = function (f){   
       if (!ie && !wk && d.addEventListener)   
          return d.addEventListener('DOMContentLoaded', f, false);   
       if (fn.push(f) > 1) return;   
       if (ie) (function () {   
          try {   
             d.documentElement.doScroll('left');   
             run();   
          }catch (err){   
             setTimeout(arguments.callee, 0);   
          }   
       })();   
       else if (wk)    
          var t = setInterval(function (){    
       if (/^(loaded|complete)$/.test(d.readyState))   
           clearInterval(t), run();    
       }, 0);   
       };   
})(); 

     /*
  * Lightweight JSONP fetcher
  * Copyright 2010-2012 Erik Karlsson. All rights reserved.
  * BSD licensed
  */
  /*
  * Usage:
  * 
  * JSONP.get( 'someUrl.php', {param1:'123', param2:'456'}, function(data){
  *   //do something with data, which is the JSON object you should retrieve from someUrl.php
  * });
  */
    var _KLIK_JSONP = (function(){
	var counter = 0, head, query, key, window = this, config = {};
	function load(url) {
		var script = document.createElement('script'),
			done = false;
		script.src = url;
		script.async = true;
 
		script.onload = script.onreadystatechange = function() {
			if ( !done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") ) {
				done = true;
				script.onload = script.onreadystatechange = null;
				if ( script && script.parentNode ) {
					script.parentNode.removeChild( script );
				}
			}
		};
		if ( !head ) {
			head = document.getElementsByTagName('head')[0];
		}
		head.appendChild( script );
	}
	function encode(str) {
		return encodeURIComponent(str);
	}
	function jsonp(url, params, callback, callbackName) {
		query = (url||'').indexOf('?') === -1 ? '?' : '&';
		params = params || {};
		for ( key in params ) {
			if ( params.hasOwnProperty(key) ) {
				query += encode(key) + "=" + encode(params[key]) + "&";
			}
		}
		var jsonp = "json" + (++counter);
		window[ jsonp ] = function(data){
			callback(data);
			try {
				delete window[ jsonp ];
			} catch (e) {}
			window[ jsonp ] = null;
		};
		load(url + query + (callbackName||config['callbackName']||'callback') + '=' + jsonp);
		return jsonp;
	}
	function setDefaults(obj){
		config = obj;
	}
	return {
		get:jsonp,
		init:setDefaults
	};
      }());




var FlyJSONP = (function (global) {
    "use strict";
    /*jslint bitwise: true*/
    var self,
        addEvent,
        garbageCollectGet,
        parametersToString,
        generateRandomName,
        callError,
        callSuccessGet,
        callSuccessPost,
        callComplete;
    
    addEvent = function (element, event, fn) {
        if (element.addEventListener) {
            element.addEventListener(event, fn, false);
        } else if (element.attachEvent) {
            element.attachEvent('on' + event, fn);
        } else {
            element['on' + event] = fn;
        }
    };
    
    garbageCollectGet = function (callbackName, script) {
        self.log("Garbage collecting!");
        script.parentNode.removeChild(script);
        global[callbackName] = undefined;
        try {
            delete global[callbackName];
        } catch (e) { }
    };
    
    parametersToString = function (parameters, encodeURI) {
        var str = "",
            key,
            parameter;
            
        for (key in parameters) {
            if (parameters.hasOwnProperty(key)) {
                key = encodeURI ? encodeURIComponent(key) : key;
                parameter = encodeURI ? encodeURIComponent(parameters[key]) : parameters[key];
                str += key + "=" + parameter + "&";
            }
        }
        return str.replace(/&$/, "");
    };
    
    //Thanks to Kevin Hakanson
    //http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/873856#873856
    generateRandomName = function () {
        var uuid = '',
            s = [],
            hexDigits = "0123456789ABCDEF",
            i = 0;
            
        for (i = 0; i < 32; i += 1) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        
        s[12] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
        s[16] = hexDigits.substr((s[16] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01

        uuid = 'flyjsonp_' + s.join("");
        return uuid;
    };
    
    callError = function (callback, errorMsg) {
        self.log(errorMsg);
        if (typeof (callback) !== 'undefined') {
            callback(errorMsg);
        }
    };
    
    callSuccessGet = function (callback, data) {
        self.log("GET success");
        if (typeof (callback) !== 'undefined') {
            callback(data);
        }
        self.log(data);
    };
    
    callSuccessPost = function (callback, data) {
        self.log("POST success");
        if (typeof (callback) !== 'undefined') {
            callback(data);
        }
        self.log(data);
    };
    
    callComplete = function (callback) {
        self.log("Request complete");
        if (typeof (callback) !== 'undefined') {
            callback();
        }
    };
    
    self = {};
    
    //settings
    self.options = {
        debug: false
    };
    
    self.init = function (options) {
        var key;
        self.log("Initializing!");
        
        for (key in options) {
            if (options.hasOwnProperty(key)) {
                self.options[key] = options[key];
            }
        }
        
        self.log("Initialization options");
        self.log(self.options);
        return true;
    };
    
    self.log = function (log) {
        if (global.console && self.options.debug) {
            global.console.log(log);
        }
    };
    
    self.get = function (options) {
        options = options || {};
        var url = options.url,
            callbackParameter = options.callbackParameter || 'callback',
            parameters = options.parameters || {},
            script = global.document.createElement('script'),
            callbackName = generateRandomName(),
            prefix = "?";
            
        if (!url) {
            throw new Error('URL must be specified!');
        }
        
        parameters[callbackParameter] = callbackName;
        if (url.indexOf("?") >= 0) {
            prefix = "&";
        }
        url += prefix + parametersToString(parameters, true);
        
        global[callbackName] = function (data) {
            if (typeof (data) === 'undefined') {
                callError(options.error, 'Invalid JSON data returned');
            } else {
                if (options.httpMethod === 'post') {
                    data = data.query.results;
                    if (!data || !data.postresult) {
                        callError(options.error, 'Invalid JSON data returned');
                    } else {
                        if (data.postresult.json) {
                            data = data.postresult.json;
                        } else {
                            data = data.postresult;
                        }
                        callSuccessPost(options.success, data);
                    }
                } else {
                    callSuccessGet(options.success, data);
                }
            }
            garbageCollectGet(callbackName, script);
            callComplete(options.complete);
        };
        
        self.log("Getting JSONP data");
        script.setAttribute('src', url);
        global.document.getElementsByTagName('head')[0].appendChild(script);
        
        addEvent(script, 'error', function () {
            garbageCollectGet(callbackName, script);
            callComplete(options.complete);
            callError(options.error, 'Error while trying to access the URL');
        });
    };
    
    self.post = function (options) {
        options = options || {};
        var url = options.url,
            parameters = options.parameters || {},
            yqlQuery,
            yqlURL,
            getOptions = {};
        
        if (!url) {
            throw new Error('URL must be specified!');
        }
        
        yqlQuery =  encodeURIComponent('select * from jsonpost where url="' + url + '" and postdata="' + parametersToString(parameters, false) + '"');
        yqlURL = 'http://query.yahooapis.com/v1/public/yql?q=' + yqlQuery + '&format=json' + '&env=' + encodeURIComponent('store://datatables.org/alltableswithkeys');
        
        getOptions.url = yqlURL;
        getOptions.httpMethod = 'post';
        
        if (typeof (options.success) !== 'undefined') {
            getOptions.success = options.success;
        }
        
        if (typeof (options.error) !== 'undefined') {
            getOptions.error = options.error;
        }
        
        if (typeof (options.complete) !== 'undefined') {
            getOptions.complete = options.complete;
        }
        
        self.get(getOptions);
    };
    
    return self;
}(this));

document.ready(function(){
		
        var klikSite="http://61.152.75.170:8080";	
	var klikCollectUrl = klikSite+"/adserver/collect?callback=?&targeturl=";
	var setCookieUrl= klikSite+"/adserver/setCookie";
	var cookieKey="_KLIK_USER";
	var browserType=getBrowserType();
	var xmlHttpRequest;
	
	var reTag = /<(?:.|\s)*?/g;
        	
	window.console.debug(browserType);
	if (browserType=="safari"){
	  var form = document.createElement("form");
          form.action = setCookieUrl;
          form.target = "_KLIK_COOKIE_FRAME";
          document.body.appendChild(form);
          var node = document.createElement("iframe");
          node.setAttribute("style", "display:none;");
	  node.setAttribute("name", "_KLIK_COOKIE_FRAME");
	  document.body.appendChild(node);
	  form.submit();
	}else{
           _KLIK_JSONP.get(setCookieUrl,function(data){});
	}

	
	function createXmlHttpRequest(){  
      if(window.ActiveXObject){  
          return new ActiveXObject("Microsoft.XMLHTTP");  
      }else if(window.XMLHttpRequest){
          return new XMLHttpRequest();  
      }  
  } 
  
  function delegate(fn,params,obj){  
      return function(){  
          fn.call(obj||window,params);  
      }  
  };
  
  var pFunc = function(ob){
		
	 temp = ob.innerText;
         temp = encodeURI(temp);
	 var currenturl = window.location.href;
         _KLIK_JSONP.get(klikCollectUrl+encodeURIComponent(ob.href)+"&keywords="+temp+"&currenturl="+currenturl,function(data){});
 	};
	
	var items = document.getElementsByTagName("a");
	for (var i = 0; i < items.length; i++)  {
		items[i].onclick = delegate(pFunc,items[i],items[i]);
  };
  
		
   
  function getBrowserType(){
        var ua = navigator.userAgent.toLowerCase();
        var Sys =
        {
          ve : ua.match(/.+(?:rv|it|ra|ie|me)[\/: ]([\d.]+)/)[1],
          ie : /msie/.test(ua) && !/opera/.test(ua),
          opera : /opera/.test(ua),
          safari : /version.*safari/.test(ua),
          chrome : /chrome/.test(ua),
          firefox : /gecko/.test(ua) && !/webkit/.test(ua)
        };       
        if(Sys.ie) return 'ie'
        if(Sys.firefox) return 'firefox';
        if(Sys.chrome) return 'chrome';
        if(Sys.opera) return 'opera';
        if(Sys.safari) return 'safari';
        return 'other';
  }
  
  

});

function _KLIK_USER_CHAR(){
   
   window.console.debug("_KLIK_USER_CHAR INVOKED");
   var klikSite="http://61.152.75.170:8080";	
   var url = klikSite+"/adserver/analyze";
   
   //$.getJSON(url,function(data){
   // 	window.console.debug(data);
   //}); 
   //_KLIK_JSONP.get(url,function(data){
  // 	window.console.debug(data);
   //});
   FlyJSONP.get({
  url: url,
  success: function (data) {
    console.log("HAS USER KLIK-------------------");
    console.log(data);
     $("#keywords").text(obj2str(data.keywordsWeight)); 
 $("#relationwords").text(obj2str(data.relationWordsWeight)); 
    $("#categories").text(obj2str(data.categoriesWeight));    

    console.debug(obj2str(data.categoriesWeight));       


  },
  error: function (errorMsg) {
     console.log("ERROR!!!!!! USER KLIK-------------------")
    console.log(errorMsg);
  }
  });	

}

function obj2str(o){
    var r = [];
    if(typeof o =="string") return "\""+o.replace(/([\'\"\\])/g,"\\$1").replace(/(\n)/g,"\\n").replace(/(\r)/g,"\\r").replace(/(\t)/g,"\\t")+"\"";
    if(typeof o == "object"){
        if(!o.sort){
            for(var i in o)
                r.push(i+":"+obj2str(o[i]));
            if(!!document.all && !/^\n?function\s*toString\(\)\s*\{\n?\s*\[native code\]\n?\s*\}\n?\s*$/.test(o.toString)){
                r.push("toString:"+o.toString.toString());
            }
            r="{"+r.join()+"}"
        }else{
            for(var i =0;i<o.length;i++)
                r.push(obj2str(o[i]))
            r="["+r.join()+"]"
        }
        return r;
    }
    return o.toString();
}



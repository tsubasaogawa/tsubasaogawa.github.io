function converter(M){
	var str="", str_as="";
	for(var i=0;i<M.length;i++){
		str_as = M.charCodeAt(i);
		str += String.fromCharCode(str_as + 1);
	}
	return str;
}

function mail_to(k_1,k_2) {
	eval(String.fromCharCode(108,111,99,97,116,105,111,110,46,104,114,101,102,32,61,32,39,109,97,105,108,116,111,58) + escape(k_1) + converter(String.fromCharCode(96,99,108,104,109,104,114,115,113,96,115,110,113,63,110,102,96,115,116,97,100,45,98,110,108,62,114,116,97,105,100,98,115,60)) + escape(k_2) + "'");
}

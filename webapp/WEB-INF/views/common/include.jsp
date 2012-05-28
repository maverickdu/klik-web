<%@ page contentType="text/html; charset=utf-8" language="java"  %>
<%
	String webappName = request.getContextPath();
	String serverPath  =  request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+webappName+"/";
%>
<html>
	<head>
		<base href="<%=serverPath%>">
		<script language='javaScript'>
			var webappName = '<%=webappName%>';
			var serverPath      = '<%=serverPath%>';
			var sessionId	   ='<%=request.getSession().getId()%>';
		</script>
		
		<script type='text/javaScript' src='javascript/jquery-1.6.4.min.js' ></script>
		
		
		
	</head>
</html>
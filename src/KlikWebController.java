import java.util.Collection;
import java.util.Map;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONObject;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import com.klik.common.controller.imp.BaseControllerImp;
import com.klik.common.util.CommonUtil;
import com.klik.common.util.WebUtil;
import com.klik.core.mo.KlikActionMO;
import com.klik.core.mo.KlikMO;
import com.klik.core.service.IKlikActionService;
import com.klik.core.service.IKlikService;
import com.klik.core.vo.KlikAnalyzerResultVO;




@Controller
@RequestMapping("/")
public class KlikWebController extends BaseControllerImp {
	
private final String _COOKIE_NAME="_KLIK_COOKIE";
	
	Logger logger=LoggerFactory.getLogger(this.getClass());
	
	@Autowired
	IKlikActionService klikActionService;
	@Autowired
	IKlikService klikService;
	
	
	@RequestMapping("collect")
	public ModelAndView collectKlik(HttpServletRequest request,
			HttpServletResponse response) throws Exception{
		Cookie userCookie=getUserIdCookie(request);
		if (userCookie==null){
			userCookie=setUserCookie(request,response);
		}
		KlikActionMO action=new KlikActionMO();
		action.setUserId(userCookie.getValue());
		action.setUserIdType("COOKIE");
		String targetUrl=request.getParameter("targeturl");
		String browser=request.getHeader("User-Agent");
		
		String keywords=request.getParameter("keywords");
		if (keywords.equalsIgnoreCase("undefined")){
			keywords=""; 
		}
		keywords=CommonUtil.removeSeparateChar(keywords.toUpperCase());
		
		String currenturl=request.getParameter("currenturl");
		
		String ip=WebUtil.getIpAddress(request);
		action.setLocationUrl(currenturl);
		action.setTargetTitle(keywords);
		action.setTargetUrl(targetUrl);
		action.setIp(ip);
		action.setBrowser(browser);
		
		klikActionService.insertAction(action);
		
		return null;
	}
	
	@RequestMapping("analyze")
	public ModelAndView analyzeUser(HttpServletRequest request,
			HttpServletResponse response) throws Exception{
		
		Cookie userCookie=getUserIdCookie(request);
		if (userCookie==null){
			logger.warn("CAN't find user Cookie---------------------");
			userCookie=setUserCookie(request,response);
		}
		long now=System.currentTimeMillis();
		Map<KlikActionMO, KlikMO> klikMaps=klikService.queryKlik(userCookie.getValue(), now-1000*60*60*24*60, now);
		Collection<KlikMO> kliks=klikMaps.values();
		
		KlikMO klik=KlikMO.combineKlik(kliks);
		KlikAnalyzerResultVO analyzeResultVO=new KlikAnalyzerResultVO();
		analyzeResultVO.setCategoriesWeight(CommonUtil.mapSortDouble(klik.getCategoriesWeight(), 5));
		analyzeResultVO.setKeywordsWeight(CommonUtil.mapSortDouble(klik.getKeyWordsWeight(), 5));
		analyzeResultVO.setRelateWordsWeight(CommonUtil.mapSortDouble(klik.getRelateWordsWeight(),10));
		
		response.setContentType("text/javascript");      
	    String callback=request.getParameter("callback");     
	    
	    response.getWriter().print(callback+"("+JSONObject.fromObject(analyzeResultVO).toString()+")");
		
		return null;
	}
	
	@RequestMapping("setCookie")
	public ModelAndView setCookie(HttpServletRequest request,
		HttpServletResponse response) throws Exception{
		
		response.setHeader("P3P","CP='IDC DSP COR ADM DEVi TAIi PSA PSD IVAi IVDi CONi HIS OUR IND CNT'");
		Cookie userCookie=getUserIdCookie(request);
		if (userCookie!=null){
			userCookie.setMaxAge(Integer.MAX_VALUE);
			return null;
		}
		
		setUserCookie(request,response);
		
		return null;
	}
	
	@RequestMapping("getCookie")
	public ModelAndView getCookie(HttpServletRequest request,
			HttpServletResponse response) throws Exception{
		response.setHeader("P3P","CP='IDC DSP COR ADM DEVi TAIi PSA PSD IVAi IVDi CONi HIS OUR IND CNT'");
		Cookie aCookie=getUserIdCookie(request);
		System.out.println(aCookie);
		return null;
	}
	private Cookie setUserCookie(HttpServletRequest request,HttpServletResponse response){
		String userId=System.currentTimeMillis()+"_"+CommonUtil.randomString(10);
		Cookie cookie=new Cookie(_COOKIE_NAME,userId);
		cookie.setMaxAge(Integer.MAX_VALUE);
		cookie.setPath("/");
		response.addCookie(cookie);
		return cookie;
	}
	private Cookie getUserIdCookie(HttpServletRequest request){
		Cookie[] cookies = request.getCookies();
		if (cookies==null) return null;
		for(Cookie cookie:cookies){
			if (cookie.getName().equals(_COOKIE_NAME)){
				return cookie;
			}
		}
		return null;
	}
}

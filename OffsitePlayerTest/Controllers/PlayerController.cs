using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using NWebsec.Mvc.HttpHeaders.Csp;

namespace OffsitePlayerTest.Controllers
{
    public class PlayerController : Controller
    {
        // GET: Home
        public ActionResult BlogTalkRadio()
        {
            return View();
        }

        public ActionResult Kaltura()
        {
            return View();
        }


        [CspConnectSrc(CustomSources = "*.facebook.com", Enabled = true)]
        [CspFrameSrc(CustomSources = "*.facebook.com", Enabled = true)]
        [CspChildSrc(CustomSources = "*.facebook.com", Enabled = true)]
        public ActionResult Redirect()
        {
            return Redirect("~/offsiteplayer?hostId=38577&episodeId=1504885");
        }
    }
}
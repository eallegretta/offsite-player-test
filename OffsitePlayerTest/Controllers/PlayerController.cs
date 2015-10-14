using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

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

        public ActionResult Redirect()
        {
            return Redirect("https://securebeta.blogtalkradio.com/offsiteplayer?hostId=38577&episodeId=1504885");
        }
    }
}
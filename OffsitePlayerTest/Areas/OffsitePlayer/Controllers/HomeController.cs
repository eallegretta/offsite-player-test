using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace BlogTalkRadio.Www.Web.Areas.OffsitePlayer.Controllers
{
    public class HomeController : Controller
    {
        //
        // GET: /OffsitePlayer/Home/
        public ActionResult Index()
        {
            return View();
        }

        [Route("hosts/{hostId}/episodes/{episodeId}/info")]
        public ActionResult HostData(int hostId, int episodeId)
        {
            return Content(@"
{""Id"":1504885,""Date"":""2011-01-24T21:30:00"",""ShortPitch"":null,""Description"":""Also with special guest correspondent Chauncy Welliver."",""Duration"":134,""EndDate"":""2011-01-25T04:43:24"",""Title"":""On The Ropes Episode #109 Guests Dereck Chisora, Sherman Williams & Devon Alexander"",""Url"":""on-the-ropes-episode-109-guests-dereck-chisora-sha"",""FullUrl"":""http://localhost:64804/on-the-ropes/2011/01/25/on-the-ropes-episode-109-guests-dereck-chisora-sha"",""IsFeatured"":false,""Tags"":[""Pacquiao"",""Mayweather"",""Holyfield"",""Alexander"",""Klitschko""],""StartupAudio"":0,""Visibility"":1,""Category"":{""Id"":43,""Description"":""Sports"",""Url"":""http://localhost:64804/sports"",""LongDescription"":""As home to The Fantasy Sports Channel, BlogTalkRadio's got nearly 100 fantasy shows to help you dominate your league. From Roto baseball to Dynasty football, keep up with your players' latest moves 24/7. For the purists, we've got expert analysis on every sport, from amateur to pro. Our listeners and hosts distinguish American football from World Cup, Formula One from NASCAR, live and breathe March Madness and follow sports preceded by extreme, live and ultimate. Plus, athletes will find tips to improve their game. Browse baseball, basketball, boating, auto racing, football, golf, boxing, cricket, cycling, hockey, horse racing, lacrosse, motorsports, Olympics (reminding us every four years the world's got more sports than you can shake a dressage whip at), poker, rock climbing, rugby, running, skateboarding, sky diving, soccer, tennis and more. Whether you're a trash-talking diehard or only pay attention during playoffs, we've got your game, set and match covered."",""Keywords"":""Sports"",""TrackingText"":""abacaststationid:2217,exc8_cat:023""},""Images"":[],""Status"":{""Id"":4,""Name"":""Archived""},""Time"":77400,""ImagesUrl"":""http://www.blogtalkradio.com/pics/showpics/thumbs/"",""ConferenceStatus"":null,""HasTranscription"":null,""Ended"":true,""Host"":{""UserId"":""296d4531-6916-4556-8d83-ef0539fe6f97"",""HostId"":38577,""DisplayName"":""On The Ropes"",""FirstName"":""Jenna "",""LastName"":""smith"",""ImageName"":""296d4531-6916-4556-8d83-ef0539fe6f97_newotrjenna3.jpg"",""PageTitle"":""On The Ropes"",""SignUpDate"":""2009-01-02T20:47:02"",""ThumbImageUrl"":""http://cdn2.btrcdn.com/pics/hostpics/thumbs/296d4531-6916-4556-8d83-ef0539fe6f97_newotrjenna3.jpg"",""FullImageUrl"":""http://cdn2.btrcdn.com/pics/hostpics/296d4531-6916-4556-8d83-ef0539fe6f97_newotrjenna3.jpg"",""TimeZoneId"":449,""Url"":""on-the-ropes"",""FullUrl"":""http://localhost:64804/on-the-ropes""}}
            ", "application/json", Encoding.UTF8);
        }
    }
}

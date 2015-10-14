using System.Web.Mvc;

namespace BlogTalkRadio.Www.Web.Areas.OffsitePlayer
{
    public class OffsitePlayerAreaRegistration : AreaRegistration
    {
        public override string AreaName
        {
            get { return "OffsitePlayer"; }
        }

        public override void RegisterArea(AreaRegistrationContext context)
        {
            context.MapRoute(
                "OffsitePlayer_default",
                "OffsitePlayer/{controller}/{action}/{id}",
                new { area="OffsitePlayer", action = "Index", controller = "Home", id = UrlParameter.Optional }
            );
        }
    }
}

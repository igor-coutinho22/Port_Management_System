using System.Text.RegularExpressions;

namespace WebApp.Models.Domain.VesselVisits
{
    public class Container
    {
        public string Identifier { get; private set; }

        private Container() { }

        public Container(string identifier)
        {
            if (!IsValidContainerId(identifier))
                throw new ArgumentException("Invalid container ID per ISO 6346:2022");
            Identifier = identifier;
        }

        private bool IsValidContainerId(string id)
        {
            // ISO 6346 validation pattern: 3 letters + 1 category + 6 digits + 1 check digit
            var pattern = @"^[A-Z]{3}[UJZ][0-9]{7}$";
            return Regex.IsMatch(id, pattern, RegexOptions.IgnoreCase);
        }
    }
}

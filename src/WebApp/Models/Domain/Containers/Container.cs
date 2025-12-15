using System.Text.RegularExpressions;

namespace WebApp.Models.Domain.Containers
{
    public class Container
    {
        public string Identifier { get; private set; } = string.Empty;

        // 1 = 20ft, 2 = 40ft, etc.
        public int Teu { get; private set; }

        protected Container() { }

        public Container(string identifier, int teu)
        {
            if (!IsValidContainerId(identifier))
                throw new ArgumentException("Invalid container ID per ISO 6346:2022");

            if (teu <= 0)
                throw new ArgumentOutOfRangeException(nameof(teu), "TEU must be positive.");

            Identifier = identifier;
            Teu = teu;
        }

        private bool IsValidContainerId(string id)
        {
            var pattern = @"^[A-Z]{3}[UJZ][0-9]{7}$";
            return Regex.IsMatch(id, pattern, RegexOptions.IgnoreCase);
        }   
    }
}

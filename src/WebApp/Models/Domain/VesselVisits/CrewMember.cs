namespace WebApp.Models.Domain.VesselVisits
{
    public class CrewMember
    {
        public Guid Id { get; private set; } = Guid.NewGuid();
        public string Name { get; private set; } = default!;
        public string CitizenId { get; private set; } = default!;
        public string Nationality { get; private set; } = default!;

        private CrewMember() { }

        public CrewMember(string name, string citizenId, string nationality)
        {
            ValidateName(name);
            Name = name;
            ValidateCitizenId(citizenId);
            CitizenId = citizenId;
            ValidateNationality(nationality);
            Nationality = nationality;
        }

        private void ValidateName(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException("Name cannot be null or empty.");
            }

            if (name.Length < 2 || name.Length > 20)
            {
                throw new ArgumentException("Name must be between 2 and 20 characters long.");
            }

            if (!name.All(c => char.IsLetter(c) || c == ' ' || c == '-' || c == '\''))
            {
                throw new ArgumentException("Name contains invalid characters.");
            }

            if(name.StartsWith(" ") || name.EndsWith(" "))
            {
                throw new ArgumentException("Name cannot start or end with a space.");
            }

            if(name.Any(char.IsDigit))
            {
                throw new ArgumentException("Name cannot contain numbers.");
            }
        }

        private void ValidateCitizenId(string citizenId)
        {
            // Implement validation logic for Citizen ID here
            if (string.IsNullOrWhiteSpace(citizenId))
            {
                throw new ArgumentException("Citizen ID cannot be null or empty.");
            }

            if (citizenId.Length < 5 || citizenId.Length > 15)
            {
                throw new ArgumentException("Citizen ID must be between 5 and 15 characters long.");
            }

            if (!citizenId.All(char.IsLetterOrDigit))
            {
                throw new ArgumentException("Citizen ID must be alphanumeric.");
            }
        }

        private void ValidateNationality(string nationality)
        {
            if (string.IsNullOrWhiteSpace(nationality))
            {
                throw new ArgumentException("Nationality cannot be null or empty.");
            }

            if (nationality.Length != 2 && nationality.Length != 3)
            {
                throw new ArgumentException("Nationality must be a valid 2-letter or 3-letter country code (eg: PT or PRT).");
            }

            if (nationality.Any(c => !char.IsUpper(c)))
            {
                throw new ArgumentException("Nationality must contain only uppercase letters.");
            }
        }
    }
}

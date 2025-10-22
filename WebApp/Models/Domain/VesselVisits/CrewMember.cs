namespace WebApp.Models.Domain.VesselVisits
{
    public class CrewMember
    {
        public Guid Id { get; private set; } = Guid.NewGuid();
        public string Name { get; private set; }
        public string CitizenId { get; private set; }
        public string Nationality { get; private set; }

        private CrewMember() { }

        public CrewMember(string name, string citizenId, string nationality)
        {
            Name = name;
            CitizenId = citizenId;
            Nationality = nationality;
        }
    }
}

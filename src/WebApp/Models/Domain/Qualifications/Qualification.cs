using WebApp.Models.Domain.Staff;

namespace WebApp.Models.Domain.Qualifications
{
    public class Qualification
    {
        public string Code { get; set; } = default!;
        public string Name { get; set; } = default!;
        public ICollection<QualificationLink> QualificationLinks { get; set; } = new List<QualificationLink>();
        
        protected Qualification() { }  // EF Core requirement

        public Qualification(string code, string name)
        {
            if (string.IsNullOrWhiteSpace(code))
                throw new ArgumentNullException(nameof(code));

            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Name cannot be empty.", nameof(name));

            Code = code;
            Name = name;
        }
    }
}

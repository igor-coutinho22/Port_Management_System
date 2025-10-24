namespace WebApp.Models.Domain.Qualifications
{
    public class Qualification
    {
        public string Code { get; set; } = default!;
        public string Name { get; set; } = default!;

        protected Qualification() { }  // EF Core requirement

        public Qualification(string code, string name)
        {
            Code = code;
            Name = name;
        }
    }
}

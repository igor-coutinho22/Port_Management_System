using WebApp.Models.Domain.Common;

namespace WebApp.Models.Domain.Qualifications
{
    public class Qualification : BaseEntity
    {
        public string Code { get; private set; }
        public string Name { get; private set; }

        private Qualification() { } // Required by EF

        public Qualification(string code, string name)
        {
            Id = Guid.NewGuid();
            Code = code;
            Name = name;
        }

        public void Update(string name)
        {
            Name = name;
        }
    }
}


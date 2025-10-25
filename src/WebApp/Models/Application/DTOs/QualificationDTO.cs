namespace WebApp.Models.Application.DTOs
{
    public class QualificationDTO
    {
        public string Code { get; set; } = default!;
        public string Name { get; set; } = default!;
        public DateOnly? DateObtained { get; set; }
        public DateOnly? ExpiryDate { get; set; }
    }
}

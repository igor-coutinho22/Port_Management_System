public class Staff
{
    public string MecanographicNumber { get; set; } = default!;
    public string ShortName { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string Phone { get; set; } = default!;
    public StaffStatus Status { get; set; }
    public string OperationalWindow { get; set; } = default!;
    public ICollection<QualificationLink> QualificationLinks { get; set; } = new List<QualificationLink>();

    protected Staff() { } // EF Core requirement

    public Staff(
        string mecanographicNumber,
        string shortName,
        string email,
        string phone,
        StaffStatus status,
        string operationalWindow)
    {
        if (string.IsNullOrWhiteSpace(mecanographicNumber))
            throw new ArgumentException("Mecanographic number is required.", nameof(mecanographicNumber));

        if (string.IsNullOrWhiteSpace(shortName))
            throw new ArgumentException("Short name is required.", nameof(shortName));

        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email is required.", nameof(email));

        if (!IsValidEmail(email))
            throw new ArgumentException("Email format is invalid.", nameof(email));

        if (string.IsNullOrWhiteSpace(phone))
            throw new ArgumentException("Phone is required.", nameof(phone));

        if (string.IsNullOrWhiteSpace(operationalWindow))
            throw new ArgumentException("Operational window is required.", nameof(operationalWindow));

        MecanographicNumber = mecanographicNumber.Trim();
        ShortName = shortName.Trim();
        Email = email.Trim();
        Phone = phone.Trim();
        Status = status;
        OperationalWindow = operationalWindow.Trim();
    }

    private static bool IsValidEmail(string email)
    {
        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }

    public void Activate()
    {
        if (Status == StaffStatus.Available)
            throw new InvalidOperationException("Staff is already active.");
        Status = StaffStatus.Available;
    }

    public void Deactivate()
    {
        if (Status == StaffStatus.Unavailable)
            throw new InvalidOperationException("Staff is already inactive.");
        Status = StaffStatus.Unavailable;
    }
    
    public void AddQualification(Qualification qualification, DateOnly? obtained = null, DateOnly? expiry = null)
    {
    if (qualification == null)
        throw new ArgumentNullException(nameof(qualification));

    if (obtained.HasValue && expiry.HasValue && expiry < obtained)
        throw new ArgumentException("Expiry date cannot be before date obtained.");

    if (QualificationLinks.Any(q => q.QualificationCode == qualification.Code))
        throw new InvalidOperationException($"Staff already has qualification '{qualification.Code}'.");

    QualificationLinks.Add(new QualificationLink(
        MecanographicNumber,
        qualification.Code,
        obtained,
        expiry
    ));
    }

    public void RemoveQualification(string qualificationCode)
    {
    var link = QualificationLinks.FirstOrDefault(l => l.QualificationCode == qualificationCode);
    if (link == null)
        return;

    QualificationLinks.Remove(link);
    }
}



public sealed class EmailSender : IEmailSender
{
    private readonly ILogger<EmailSender> _logger;
    public EmailSender(ILogger<EmailSender> logger) => _logger = logger;

    public Task SendEmailAsync(string to, string subject, string htmlBody)
    {
        _logger.LogInformation("EMAIL to {To} | {Subject}\n{Body}", to, subject, htmlBody);
        return Task.CompletedTask;
    }
}

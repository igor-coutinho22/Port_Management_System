
using System.Net;
using System.Net.Mail;
using System.Text;

public sealed class EmailSender : IEmailSender
{
    public Task SendEmailAsync(string to, string subject, string htmlBody)
    {
        var message = new MailMessage();
        message.From = new MailAddress("1211064@isep.ipp.pt");
        message.To.Add(to);
        message.Subject = subject;
        message.Body = htmlBody;
        message.IsBodyHtml = true;
        message.BodyEncoding = Encoding.UTF8;
        message.SubjectEncoding = Encoding.UTF8;


        using var client = new SmtpClient("smtp.office365.com", 587)
        {
            EnableSsl = true,
            Credentials = new NetworkCredential("1211064@isep.ipp.pt", "200703Msoares")
        };

        client.Send(message);
        return Task.CompletedTask;
    }
}

namespace WebApp.Models.Domain.Common
{
    public abstract class BaseEntity
    {
        public Guid Id { get; protected set; }
    }
}

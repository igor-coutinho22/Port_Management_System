namespace WebApp.Models.Domain.Resources;

public class Resource
{
    public long Id { get; set; }
    public string? Name { get; set; }

    public Resource(long id, string name)
    {
        Id = id;
        Name = name;
    }
}
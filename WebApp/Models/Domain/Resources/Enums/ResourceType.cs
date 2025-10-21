namespace WebApp.Models.Domain.Resources.Enums
{
    public enum ResourceType
    {
        STSCrane,
        YardCrane,
        Truck,
        Tractor
    }

    public static class ResourceTypeExtensions
    {
        public static string GetDisplayName(this ResourceType type)
        {
            return type switch
            {
                ResourceType.STSCrane => "STS Crane",
                ResourceType.YardCrane => "Yard Crane",
                ResourceType.Truck => "Truck",
                ResourceType.Tractor => "Tractor",
                _ => type.ToString()
            };
        }
    }
}

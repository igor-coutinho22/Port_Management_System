using System;
using System.Collections.Generic;
using PortManagement.Domain.Enums;

namespace WebApp.Models.Application.DTOs
{
    public class ContainerYardDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public StorageAreaType Type { get; set; }
        public int MaxCapacityTeu { get; set; }
        public int CurrentOccupancyTeu { get; set; }
        public List<Guid>? DockIds { get; set; }
    }
}

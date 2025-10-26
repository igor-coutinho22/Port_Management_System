using System;
using System.Collections.Generic;

namespace WebApp.Models.Application.DTOs
{
    public class ContainerYardDto
    {
        public string? Name { get; set; }
        public int MaxCapacityTeu { get; set; }
        public int CurrentOccupancyTeu { get; set; }
        public List<Guid>? DockIds { get; set; }
    }
}

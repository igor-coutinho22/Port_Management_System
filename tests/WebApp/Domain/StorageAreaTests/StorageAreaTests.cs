using WebApp.Models.Domain.StorageArea;
using WebApp.Models.Infrastructure.Repositories;
using WebApp.Models.Context;
using FluentAssertions;
using Xunit;
using System;
using System.Collections.Generic;
using WebApp.Models.Domain.Docks;

public class StorageAreaTests
{
    [Fact]
    public void ContainerYard_ShouldInitializeAllProperties()
    {
        var yard = new ContainerYard
        (
            name: "Main Yard",
            maxCapacityTeu: 500,
            docksServed: new List<Dock>()
        );

        yard.Id.Should().Be(0);
        yard.Name.Should().Be("Main Yard");
        yard.MaxCapacityTeu.Should().Be(500);
        yard.DocksServed.Should().BeEmpty();
    }

    [Fact]
    public void ContainerYard_ShouldAllowCapacityChange()
    {
        var yard = new ContainerYard(name: "Adjustable Yard", maxCapacityTeu: 300, docksServed: new List<Dock>());
        yard.ChangeMaxCapacity(400);

        yard.MaxCapacityTeu.Should().Be(400);
    }

    [Fact]
    public void ContainerYard_ShouldThrow_WhenNegativeCapacity()
    {
        var yard = new ContainerYard(name: "Invalid Yard", maxCapacityTeu: 200, docksServed: new List<Dock>());
        var act = () => yard.ChangeMaxCapacity(-10);

        act.Should().Throw<ArgumentException>()
            .WithMessage("*cannot be less than current occupancy*");
    }

    [Fact]
    public void Warehouse_ShouldInitializeAllProperties()
    {
        var warehouse = new Warehouse
        (
            name: "Warehouse A",
            maxCapacityTeu: 1000,
            specializedCargoType: "General"
        );

        warehouse.Name.Should().Be("Warehouse A");
        warehouse.MaxCapacityTeu.Should().Be(1000);
        warehouse.SpecializedCargoType.Should().Be("General");
    }

    [Fact]
    public void Warehouse_ShouldAllowUpdatingCargoType()
    {
        var warehouse = new Warehouse
        (
            name: "Warehouse B",
            maxCapacityTeu: 800,
            specializedCargoType: "General"
        );

        warehouse.UpdateCargoType("Hazardous");

        warehouse.SpecializedCargoType.Should().Be("Hazardous");
    }

    [Fact]
    public void Warehouse_ShouldAllowCapacityUpdate()
    {
        var warehouse = new Warehouse
        (
            name: "Warehouse C",
            maxCapacityTeu: 600,
            specializedCargoType: "General"
        );

        warehouse.ChangeMaxCapacity(700);

        warehouse.MaxCapacityTeu.Should().Be(700);
    }

}

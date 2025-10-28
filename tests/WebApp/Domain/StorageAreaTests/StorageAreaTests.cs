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
            currentOccupancyTeu: 200,
            docksServed: new List<Dock>()
        );

        yard.Id.Should().Be(0);
        yard.Name.Should().Be("Main Yard");
        yard.MaxCapacityTeu.Should().Be(500);
        yard.CurrentOccupancyTeu.Should().Be(200);
        yard.DocksServed.Should().BeEmpty();
    }

    [Fact]
    public void ContainerYard_ShouldAllowCapacityChange()
    {
        var yard = new ContainerYard (name: "Adjustable Yard", maxCapacityTeu: 300, currentOccupancyTeu: 100, docksServed: new List<Dock>());
        yard.ChangeMaxCapacity(400);

        yard.MaxCapacityTeu.Should().Be(400);
    }

    [Fact]
    public void ContainerYard_ShouldThrow_WhenNegativeCapacity()
    {
        var yard = new ContainerYard (name: "Invalid Yard", maxCapacityTeu: 200, currentOccupancyTeu: 0, docksServed: new List<Dock>());
        var act = () => yard.ChangeMaxCapacity(-10);

        act.Should().Throw<ArgumentException>()
            .WithMessage("*cannot be less than current occupancy*");
    }

    [Fact]
    public void ContainerYard_ShouldUpdateOccupancy()
    {
        var yard = new ContainerYard (name: "Occupancy Yard", maxCapacityTeu: 500, currentOccupancyTeu: 0, docksServed: new List<Dock>());
        yard.UpdateCurrentOccupancy(150);

        yard.CurrentOccupancyTeu.Should().Be(150);
    }

    [Fact]
    public void ContainerYard_ShouldThrow_WhenOccupancyExceedsCapacity()
    {
        var yard = new ContainerYard (name: "Overflow Yard", maxCapacityTeu: 100, currentOccupancyTeu: 0, docksServed: new List<Dock>());
        var act = () => yard.UpdateCurrentOccupancy(150);

        act.Should().Throw<ArgumentOutOfRangeException>()
            .WithMessage("*must be between 0 and max capacity*");
    }

    [Fact]
    public void Warehouse_ShouldInitializeAllProperties()
    {
        var warehouse = new Warehouse
        (
            name: "Warehouse A",
            maxCapacityTeu: 1000,
            currentOccupancyTeu: 400,
            specializedCargoType: "General"
        );

        warehouse.Name.Should().Be("Warehouse A");
        warehouse.MaxCapacityTeu.Should().Be(1000);
        warehouse.CurrentOccupancyTeu.Should().Be(400);
        warehouse.SpecializedCargoType.Should().Be("General");
    }

    [Fact]
    public void Warehouse_ShouldAllowUpdatingCargoType()
    {
        var warehouse = new Warehouse
        (
            name: "Warehouse B",
            maxCapacityTeu: 800,
            currentOccupancyTeu: 300,
            specializedCargoType: "General"
        );

        warehouse.UpdateCargoType("Hazardous");

        warehouse.SpecializedCargoType.Should().Be("Hazardous");
    }

    [Fact]
    public void Warehouse_ShouldAllowCapacityAndOccupancyUpdate()
    {
        var warehouse = new Warehouse
        (
            name: "Warehouse C",
            maxCapacityTeu: 600,
            currentOccupancyTeu: 200,
            specializedCargoType: "General"
        );

        warehouse.ChangeMaxCapacity(700);
        warehouse.UpdateCurrentOccupancy(300);

        warehouse.MaxCapacityTeu.Should().Be(700);
        warehouse.CurrentOccupancyTeu.Should().Be(300);
    }

    [Fact]
    public void Warehouse_ShouldThrow_WhenOccupancyExceedsCapacity()
    {
        var warehouse = new Warehouse
        (
            name: "Small Warehouse",
            maxCapacityTeu: 100,
            currentOccupancyTeu: 50,
            specializedCargoType: "General"
        );

        var act = () => warehouse.UpdateCurrentOccupancy(200);

        act.Should().Throw<ArgumentOutOfRangeException>()
            .WithMessage("*must be between 0 and max capacity*");
    }
}

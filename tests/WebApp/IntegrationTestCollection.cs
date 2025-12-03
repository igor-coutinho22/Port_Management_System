using Xunit;

[CollectionDefinition("IntegrationTests")]
public class IntegrationTestCollection : ICollectionFixture<TestDatabaseFixture>
{
    // No code here. This just associates the fixture with the collection.
}

Feature: Check Friday

    This is feature check friday

    Scenario: Sunday isn't not friday
    Given today is Sunday
    When I ask the weather is Friday yet
    Then I should told be "Nope"
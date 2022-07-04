SELECT
    [Body Text],
    [Template Name],
    [Manual Tokens],
    [Subject Line],
    [Allow Email],
    [Landscape]
FROM
    [Letter Template Lookup]
WHERE
    [Template Name] = @Value
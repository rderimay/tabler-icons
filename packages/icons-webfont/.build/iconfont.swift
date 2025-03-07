/*!
 * Tabler Icons <%= v %> by tabler - https://tabler.io
 * License - https://github.com/tabler/tabler-icons/blob/master/LICENSE
 */
 

public enum TablerIconToken: String {<% glyphs.forEach(function(glyph) { %>
    case `<%= toCamelCase(glyph.name) %>` = "<%= glyph.name %>"<% }); %>

// Aliases
<% Object.entries(sanitizedAliases).forEach(function([from, to]) { %>
    case `<%= toCamelCase(from) %>` = "<%= from %>" // Alias of <%= to %><% }); %>

    public static let iconTokenMap = [
<% glyphs.forEach(function(glyph) { 
    const glyphUnicode = glyph.unicode[0].codePointAt(0).toString(16)
    const isForbiddenUnicode = forbiddenUnicodes.includes(glyphUnicode.toUpperCase()) %>
    <%= (isForbiddenUnicode ? "// " : "") %>"<%= glyph.name %>": "<%= '\\u{' + glyphUnicode + '}' %>",<%= isForbiddenUnicode ? " Unsupported Unicode" : "" %><% }); %>

// Aliases
<% Object.entries(sanitizedAliases).forEach(function([from, to]) { 
    const glyph = glyphs.find(e => { return e.name === to })
    const glyphUnicode = glyph ? glyph.unicode[0].codePointAt(0).toString(16) : '#-NOT-FOUND-#'
    const isForbiddenUnicode = forbiddenUnicodes.includes(glyphUnicode.toUpperCase()) %>
    <%= (isForbiddenUnicode ? "// " : "") %>"<%= from %>": "<%= '\\u{' + glyphUnicode + '}' %>",<%= isForbiddenUnicode ? " Unsupported Unicode" : "" %><% }); %>
    ]
}
/*!
 * Tabler Icons <%= v %> by tabler - https://tabler.io
 * License - https://github.com/tabler/tabler-icons/blob/master/LICENSE
 */
 

public enum TablerIconToken: String {
<% glyphs.forEach(function(glyph) { %>
    case `<%= camelCase(glyph.name) %>` = "<%= glyph.name %>"<% }); %>

    public static let iconTokenMap = [
<% glyphs.forEach(function(glyph) { %>
    "<%= glyph.name %>": "\u{<%= glyph.unicode[0].codePointAt(0).toString(16) %>}",<% }); %>
    ]
}
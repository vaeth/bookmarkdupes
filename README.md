# bookmarkdupes

(C) Martin Väth <martin@mvath.de>, <mvath.develop@gmail.com>

This project is under the GNU Public License 2.0.

A WebExtension which can display/remove duplicate bookmarks or empty folders.

After installing bookmarkdupes, the usage is rather simple:

To open bookmarkdupes, click the extension symbol (duplicate stars) or
use the link in the options page of the extension.
**Do not enable “Expert Mode”** (unless you fully understand the consequences,
see separate section).
Then select what you want to display:

1. Bookmark duplicates
2. Empty folders
3. Non-duplicate bookmarks

After this, you will be offered the list of bookmarks with checkboxes;
in case 1 the numbers indicate the order in which matching bookmarks
were added according to the internally stored date.
There are also buttons to select/unselect convenient sets of checkboxes.

Finally, there are buttons to remove the selected bookmarks.

**Be aware that removing bookmarks is irreversible!**
*It is recommended to make backups of your bookmarks first!*

Currently, there is no working version of the extension available for android
(see section **Known Bugs**).

## Important

When you reorganized/added/removed bookmarks, make sure to update the
displayed list (by pressing the corresponding button) before removing
bookmarks!

## Permissions

The extension requires the following permissions for these reasons:

1. “bookmarks” to read/modify bookmarks
2. “storage” to store/restore the customized rules in expert mode.
   Unfortunately, “storage” is not one of the optional permissions which might
   be required only if that feature is actually requested by the user.

## Expert Mode

When selecting the checkbox for expert mode, details can be configured to
ignore certain bookmarks when calculating the list or under which cases
bookmarks are considered to be dupes of each other.

In non-expert mode, two bookmarks are considered to be duplicates of each
other if their URL coincides.
In expert mode there are custom rules by which the URL which is actually
used for comparison is to be modified. The details are as follows.

For every bookmark the rules are applied in the given order.
There are 2 types of rules: Filter rules and URL modification rules
(there are also disabled rules which are only listed but have no effect).

For both types of rules 4 regular expressions can be specified which are used
to determine if the rule applies: If the corresponding regular expression is
nonempty, the corresponding condition must be satisfied or the rule will not
apply. (In the case of filter rules, at least one of these 4 regular
expressions must be nonempty or that filter rules will not apply either.)

The 4 regular expressions refer to the bookmark's name or url, respectively,
and the regular expressions must either match or not match, respectively.

- The term “regular expression” refers to a javascript type regular expression.
- The bookmark's name refers to the full bookmark path as it appears in the
  browser with folder names separated by the null character.
  For instance, if you have in “Bookmark Menu” a folder “Collection”
  which contains your bookmark "Example", the bookmark's name becomes
  `Bookmark Menu\0Collection\0Example` (where `\0` denotes the null character
  which can be matched by the regular expression with `\0` or `\x00`).
- The bookmark's URL refers to the bookmark URL after possible modifications
  by previous modifier rules.

If a filter rule applies, the corresponding bookmark is ignored, i.e.,
it will not be considered as a duplicate and will neither appear in the
list of empty folders nor of all bookmarks.

If a URL modification rule applies, a text replacement will occur:
All parts matching a specified regular expression are substituted by a
replacement text (which might be empty).
The rules for this correspond to the javascript String.prototype.replace
function with the global modifier.

In particular, the replacement text can contain symbols like
`$&` or `$1` to refer to the whole matched text or to the
match of the first brace in the regular expression, respectively.

The following 5 replacement texts have a special meaning which goes beyond
the standard javascript replacement rules.

Note that this special meaning is only active if this is the full replacement
text. In other words, to get the special meaning, the replacement text must not
contain anything else than these 4-6 characters.
(This does not really restrict the functionality, because one can combine
several rules to work around that limitation if necessary.)

1. `\L$&` is the match in lower case.
2. `\U$&` is the match in upper case.
3. `$URL` is the url before any other rules have been applied.
4. `$NAME` is the bookmark's full name/path with folders separated by the
    null character, e.g. “Bookmark Menu\0Collection\0Example”
5. `$TITLE` is the bookmark's title without the path; for instance, for the
    bookmark name “Bookmark Menu | Collection | Example” it is “Example”.

Cases 3-5 can be preceeded or followed by `$$&` to prepend or append the match.

## Examples for special tasks which can be done in Expert Mode

### Task

1. Consider two bookmarks as duplicate if their URL differs only in `https:` vs. `http:` at the beginnning.

2. Consider two bookmarks as duplicate if their URL matches up to the first `?` symbol, i.e. only their additional information differs.

3. Do not consider any bookmark from any folder named ``Mr. Dupe`` as a duplicate.

4. Add all bookmarks to the list of duplicates, whether duplicate or not.

5. Add all bookmarks from the folder `Bookmark Menu | Remove` to the list of duplicates (no matter whether they actually are duplicates).

6. Consider two bookmarks as duplicate if they have the same name (instead of the same URL).

7. Consider two bookmarks as duplicate if they reside in the same folder.

### How to do the above tasks in Expert Mode

1. Use the replacement rule: “Replace URL matches” `^http:` “by” `^https:`

Explanation: By replacing everywhere the URL beginnning with `http:`
by `https:`, it does not matter whether the actual URL started with `http:`
or `https:`. Of course, we could have exchanged the roles of `http`
and `https` in our rule.

2. Use the replacement rule: “Replace URL matches” `\?.*` “by” ` ` (empty string)

Explanation: Simply omit the ? symbol and all other symbols following it
in all URLs.

3. Use the filter rule: “Name matches” `\0Mr\. Dupe\0` or `\0Mr[.] Dupe\0`

Explanation: If a bookmark is in a folder named “Mr. Dupe”, its full name (path) will contain the text “\0Mr. Dupe\0”; so match that text. Since the “.” symbol has a special meaning for regular expressions, we have to quote it. This can be done by either `\.` or by looking for a character class `[…]` which contains only the single symbol `.`.

4. Use the replacement rule: “Replace URL matches” `.+` “by” `constant`

Explanation: Pretend that every bookmark has the URL `constant` by replacing all characters (`.+`) of the original URL by that text.

5. Use the replacement rule: “Name Matches” `^Bookmark Menu\0Remove\0` “Replace URL matches” `.+` “by” `constant`

As in 4, but only for bookmarks whose full name starts with the matching path.
This works only if the folder contains at least 2 bookmarks (because otherwise `constant` is not a duplicate URL). Of course, one might use an actually duplicate URL instead of `constant` to work around this limitation.

6. Use the replacement rule: “Replace URL matches” `.+` “by” `$TITLE`

Explanation: Replace all bookmark URLs by the corresponding bookmark title when looking for dupes.

7. Use the replacement rule “Replace URL matches” `.+` “by” `$NAME` followed by a further replacement rule “Replace URL matches” `[^\0]*$` “by” ` ` (empty string)

Explanation: First replace the URL by its full name path, and then omit the last component of this path by cutting of the longest sequence of non-`\0`-symbols at the end.

## Contributors

(in alphabetical order)

- Henaro aka Ironwool (Russian and Ukrainian translation; redesign icon in svg; provide favicon)
- Juan Salvador Aleixandre Talens (Spanish translation)
- YFdyh000 (Simplified Chinese translation)

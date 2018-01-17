# bookmarkdupes

(C) Martin Väth <martin@mvath.de>

This project is under the GNU Public License 2.0.

A WebExtension which can display/remove duplicate bookmarks, empty folders, or descriptions

After installing bookmarkdupes, the usage is rather simple:

To open bookmarkdupes, click the extension symbol (duplicate stars) or
use the link in the options page of the extension.
Then select what you want to display:

1. Bookmark duplicates
2. Empty folders
3. All bookmarks

After this, you will be offered the list of bookmarks with checkboxes;
in case 1 the numbers indicate the order in which matching bookmarks
were added according to the internally stored date.
There are also buttons to select/unselect convenient sets of checkboxes.

Finally, there are buttons to remove the selected bookmarks in cases 1 and 2
or to strip the descriptions of the selected bookmarks in case 3.
(The latter has some side effects, see section **Known Bugs**).

## Important

When you reorganized/added/removed bookmarks, make sure to update the
displayed list (by pressing the corresponding button) before removing
bookmarks or stripping descriptions!
In particular, stripping descriptions with an outdated list will move
the corresponding bookmarks to their previous location in the bookmark menu!

## Expert Mode

When selecting the checkbox for expert mode, details can be configured to
ignore certain bookmarks when calculating the list or under which cases
bookmarks are considered to be dupes of each other.

Normally two bookmarks are considered to be duplicates of each other if their
URL coincides. By using custom rules, the URL which is actually used for
comparison can be preprocessed. The details are as follows.

For every bookmark the rules are applied in the given order.
There are 2 types of rules: Filter rules and URL modification rules
(there are also disabled rules which are only listed but have no effect).

For both types of rules 4 regular expressions can be specified which are used
to determine if the rule applies: If the corresponding regular expression is
nonempty, the corressponding condition must be satisfied or the rule will not
apply. (In the case of filter rules, at least one of these 4 regular
expressions must be nonempty or that filter rules will not apply either.)

The 4 regular expressions refer to the bookmark's name or url, respectively,
and the regular expressions must either match or not match, respectively.

- The term "regular expression" refers to a javascript type regular expression
  as described e.g. in
  https://wiki.selfhtml.org/wiki/JavaScript/Objekte/RegExp
  or
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
- The bookmark's name refers to the full bookmark path as it appears in the
  browser with folder names separated by the null character.
  For instance, if you have in "Bookmark Menu" a folder "Collection"
  which contains your bookmark "Example", the bookmark's name becomes
  "Bookmark Menu\0Collection\0Example" (where \0 denotes the null character
  which can be matched by the regular expression with \0 or \x00).
- The bookmark's url refers to the bookmark url after possible modifications
  by previous modifier rules.

If a filter rule applies, the corresponding bookmark is ignored, i.e.,
it will not be considered as a duplicate and will neither appear in the
list of empty folders or of all bookmarks.

If a URL modification rule applies, a text replacement will occur:
All parts matching a specified regular expression are substituted by a
replacement text (which might be empty).
The rules for this correspond to the javascript replace function with the
global modifier, see e.g.
https://wiki.selfhtml.org/wiki/JavaScript/Objekte/String/replace
or
https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/String/replace

In particular, the replacement text can contain symbols like
```$&``` or ```$1``` to refer to the whole matched text or to the
match of the first brace in the regular expression, respectively.

The replacement texts ```\L$&``` and ```\U$&``` have a special meaning:
They put the matches into lower or upper case, respectively.

## Known Bugs

1. Live bookmarks are falsely recognized as empty folders, see
   https://github.com/vaeth/bookmarkdupes/issues/4
2. Stripping of descriptions works by replacing the bookmark by a freshly
   created one. In particular, it updates the bookmark creation date.
3. Stripping of descriptions creates bookmarks in the place where it was when
   the displayed list was calculated, see
   https://github.com/vaeth/bookmarkdupes/issues/11 and the second part of
   https://github.com/vaeth/bookmarkdupes/issues/8
4. In some firefox versions (e.g. 55.0.3) it has been reported that pressing
   the duplicate stars does not open a new tab. You can try to use the link
   in the options page of the extension instead if you have this problem.
   The reason for the problem is still unknown, see
   https://github.com/vaeth/bookmarkdupes/issues/38

## Contributions

(in alphabetical order)

- Henaro aka Ironwool https://github.com/perdolka (Russian and Ukrainian translation)
- Juan Salvador Aleixandre Talens https://github.com/juaalta (Spanish translation)
- YFdyh000 <yfdyh000 at gmail.com> https://github.com/yfdyh000 (Simplified Chinese translation)

const Lang = imports.lang;
const Applet = imports.ui.applet;
const PopupMenu = imports.ui.popupMenu;
const Gettext =  imports.gettext.domain('cinnagist');
const _ = Gettext.gettext;

// All applets are recommended to be called MyApplet..
function MyApplet(metadata, orientation)
{
	this._init(metadata, orientation);
}

MyApplet.prototype = {
	__proto__:Applet.TextApplet.prototype,

	_init: function(metadata, orientation)
	{
		Applet.TextApplet.prototype._init.call(this, orientation);
		this.set_applet_label("Gists");

		// Need to figure out how to make the menu display
		this.menuManager = new PopupMenu.PopupMenuManager(this);
		this.menu = new Applet.AppletPopupMenu(this, orientation);
		this.menu.addMenuItem(new PopupMenu.PopupMenuItem(_("Loading...")));
		this.menuManager.addMenu(this.menu);
	},

	on_applet_clicked: function(event)
	{
		global.log("Applet clicked");
		gists = this.get_gists();
	},

	get_gists: function ()
	{
		return [];
	}
}

function main(metadata, orientation)
{
	let myApplet = new MyApplet(metadata, orientation);
	return myApplet;
}

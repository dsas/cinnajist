// Imports:
const Lang = imports.lang;
const Applet = imports.ui.applet;
const PopupMenu = imports.ui.popupMenu;
const Json = imports.gi.Json;
const Soup = imports.gi.Soup;
const GLib = imports.gi.GLib;

const UUID = 'cinnajist@deansas.org';


// Logging - make more convenient
// Both functions taken from cinnamon-weather
function log(message)
{
	global.log(UUID + "::" + log.caller.name + message);
}
function logError(error)
{
	global.logError(UUID + "::" + logError.caller.name + ":" + error);
}


const GIST_LIST_URL = 'https://api.github.com/gists';

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

		// Setup basic menu
		this._menuManager = new PopupMenu.PopupMenuManager(this);
		this._menu = new Applet.AppletPopupMenu(this, orientation);
		this._menu.addMenuItem(new PopupMenu.PopupMenuItem("Loading..."));
		this._menuManager.addMenu(this._menu);

		// Setup soup for HTTP requests
		this._httpSession = new Soup.SessionAsync();
		Soup.Session.prototype.add_feature.call(
			this._httpSession, new Soup.ProxyResolverDefault());

		// Kick off an async request
		this.refresh_gists();
	},

	on_applet_clicked: function(event)
	{
		this._menu.toggle();
		this.refresh_gists();
	},

	refresh_gists: function ()
	{
		this._get_request(GIST_LIST_URL, function(gists)
			{
				log("removing all from menu");
				this._menu.removeAll();

				gists.foreach_element(Lang.bind(this, function(arr, index, node)
					{
						log("Iterating results");
						var description, url, user, menuText;

						description = node.get_object().get_string_member('description');
						url = node.get_object().get_string_member('url');
						user = node.get_object().get_object_member('user').get_string_member('login');

						// Stuff login and description into a menu button and on click open up a web browser
						menuText = user + ": " + description.substr(0, 30);

						this._addBrowserButton(menuText, url);
					}));
			});
	},

	/**
	 * Adds a button to the menu that opens up a web browser with the url
	 * menuText:	String - The button text
	 * url:			String - The URL that the browser should go to
	 */
	_addBrowserButton: function(menuText, url)
	{
		var menuItem, _onClick = function (event)
			{
				GLib.spawn_command_line_async("xdg-open " + url);
			};

		menuItem = new PopupMenu.PopupMenuItem(menuText);
		menuItem.connect('activate', _onClick);
		log("adding button to menu " + menuText);
		this._menu.addMenuItem(menuItem);
	},

	/**
	 * Performs a GET request on the specified URL
	 * url: URL to request
	 * fn: Function to run if successful, passed response as JSON
	 */
	_get_request: function (url, fn)
	{
		log(url);
		let message = Soup.Message.new('GET', url);
		var closure = Lang.bind(this, function(session, message)
			{
				let jp = new Json.Parser();
				jp.load_from_data(message.response_body.data, -1);
				fn.call(this, jp.get_root().get_array());
			});
		this._httpSession.queue_message(message, closure);
	}
};

function main(metadata, orientation)
{
	let myApplet = new MyApplet(metadata, orientation);
	return myApplet;
}

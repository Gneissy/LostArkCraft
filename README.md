# LostArkCraft
This app is used for maximizing the profit of crafting in the game Lost Ark.

<hr>

# Technologies
<li>Node.js</li>
<li>Express</li>
<li>MongoDB & Mongoose</li>
<li>EJS Templating</li>

# Usage
This app is deployed on https://lost-ark-craft.onrender.com/

# How to get code
<pre class="notranslate">
<code>
$ git clone https://github.com/Gneissy/LostArkCraft.git
$ cd LostArkCraft/
$ npm install
</code>
</pre>



# How it works?
<details>
<summary>Simply by changing prices. <strong>Press to see more details</strong>.</summary>
<img alt = "pic" src="https://user-images.githubusercontent.com/116559962/223535589-a5da2df0-c232-4a9c-abd9-c40c19e71248.png">

<br>

<h4>Changing price of a <strong>Battle Item</strong>:</h4>
<ul>
  <li>Corresponding <strong>battle item's</strong> price is updated in database.</li>
  <li>According to new price, profit rate of that <strong>battle item</strong> is recalculated and updated in database.</li>
</ul>
 <img alt = "pic" src="https://user-images.githubusercontent.com/116559962/223173247-960c515c-5501-4232-a14a-19426126c781.png">

<br>

<h4>Changing price of a <em>Trade Item</em>:</h4>
<ul>
  <li>Corresponding <em>trade item's</em> price is updated in database.</li>
  <li>All <strong>battle items'</strong> profit rates are recalculated and updated in the database in accordance with the new price for which the associated <em>trade item</em> is used.</li>
</ul>
<img alt = "pic" src = "https://user-images.githubusercontent.com/116559962/223173346-8a11e49d-1735-48d2-bc07-e495a37ddb0b.png">

<br>

After entering essential prices, you may want to check the list of the most profitable battle items:
<img alt = "pic" src = "https://user-images.githubusercontent.com/116559962/223538152-75311518-0ef0-4d95-b65e-6d55cb731455.png">
</details>

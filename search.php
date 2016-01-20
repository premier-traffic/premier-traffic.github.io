<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
    <meta name="format-detection" content="telephone=no"/>
    <link rel="icon" href="images/favicon.ico" type="image/x-icon">
    <title>Search</title>

    <!-- Bootstrap -->
    <link href="css/bootstrap.css" rel="stylesheet">

    <!-- Links -->

    <link rel="stylesheet" href="css/search.css">


    <!--JS-->
    <script src="js/jquery.js"></script>
    <script src="js/jquery-migrate-1.2.1.min.js"></script>

    <!--[if lt IE 9]>
    <div style=' clear: both; text-align:center; position: relative;'>
        <a href="http://windows.microsoft.com/en-US/internet-explorer/..">
            <img src="images/ie8-panel/warning_bar_0000_us.jpg" border="0" height="42" width="820"
                 alt="You are using an outdated browser. For a faster, safer browsing experience, upgrade for free today."/>
        </a>
    </div>
    <script src="js/html5shiv.js"></script>
    <![endif]-->
    <script src='js/device.min.js'></script>
  </head>
  <body>
  <div class="page">
  <!--========================================================
                            HEADER
  =========================================================-->
    
 <header class="shadow-2">

        <section class="top-row shadow-1 center767">
            <div class="container">
                <div class="navbar-header center991">
                    <h1 data-type='rd-navbar-brand' class="navbar-brand">
                        <a href="./">Wrecker Sales </a>
                    </h1>
                </div>

                <div class="contact-box">
                    <dl>
                        <dt>
                            Tel:
                        </dt>
                        <dd>
                            <a href="callto:#">800-2345-6789</a>
                        </dd>
                    </dl>

                    <ul class="inline-list">
                        <li>
                            <a href="#" class="fa fa-facebook">facebook</a>
                        </li>
                        <li>
                            <a href="#" class="fa fa-twitter">twitter</a>
                        </li>
                        <li>
                            <a href="#" class="fa  fa-google-plus">google-plus</a>
                        </li>
                    </ul>

                </div>
            </div>
        </section>

        <div id="stuck_container" class="stuck_container">
            <div class="container">
                <nav class="navbar navbar-default navbar-static-top ">


                    <ul class="navbar-nav sf-menu" data-type="navbar">
                        <li>
                            <a href="./">Home</a>
                        </li>
                        <li>
                            <a href="index-1.html">About</a>
                        </li>
                        <li class="dropdown">
                            <a href="index-2.html">Services</a>
                            <ul class="dropdown-menu">
                                <li>
                                    <a href="#">Basic Service</a>
                                </li>
                                <li>
                                    <a href="#">Vehicle Accidents <span
                                            class="icon-menu material-design-keyboard53"></span></a>
                                    <ul class="dropdown-menu">
                                        <li>
                                            <a href="#">Latest</a>
                                        </li>
                                        <li>
                                            <a href="#">Archive</a>
                                        </li>
                                    </ul>
                                </li>
                                <li>
                                    <a href="#">Insurance</a>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <a href="index-3.html">Gallery</a>
                        </li>

                        <li>
                            <a href="index-4.html">Contacts</a>
                        </li>
                    </ul>

                </nav>

                <a class="search-form_toggle" href="#"></a>
            </div>
            <div class="container  srch">
                <div class="search-form">
                    <form id="search" action="search.php" method="GET" accept-charset="utf-8">
                        <label class="search-form_label" for="in">
                            <input id="in" class="search-form_input" type="text" name="s" placeholder=""/>
                            <span class="search-form_liveout"></span>
                        </label>
                        <button type="submit" class="search-form_submit fa-search"></button>
                    </form>
                </div>
            </div>
        </div>


    </header>

  <!--========================================================
                            CONTENT
  =========================================================-->
  <main>
    <section id="content" class="content well2">
        <div class="container">
            <h3>Search Results</h3>
            <div id="search-results"></div>
        </div>
    </section>
  </main>  

  <!--========================================================
                            FOOTER
  =========================================================-->
 <footer>

         <section class="bg-secondary rights">
             <div class="container">

                 <p>
                     Wrecker Sales &#169; <span id="copyright-year"></span>&nbsp;
                     <a href="index-5.html">Privacy Policy</a>
                 </p>

             </div>
         </section>
     </footer>
  </div>

    <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
    <!-- Include all compiled plugins (below), or include individual files as needed -->         
    <script src="js/bootstrap.min.js"></script>
    <script src="js/tm-scripts.js"></script>    
  <!-- </script> -->


  </body>
</html>
